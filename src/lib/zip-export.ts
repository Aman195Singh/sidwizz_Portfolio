/**
 * Zero-dependency client-side ZIP file builder for bulk media exports.
 * Implements standard PKZip specification (PK\x03\x04, PK\x01\x02, PK\x05\x06).
 */

interface ZipEntry {
  filename: string;
  data: Uint8Array;
}

// CRC32 table generator
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function calculateCrc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = crcTable[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export function createZipBlob(entries: ZipEntry[]): Blob {
  const parts: Uint8Array[] = [];
  const centralDirEntries: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const filenameBytes = new TextEncoder().encode(entry.filename);
    const crc = calculateCrc32(entry.data);
    const size = entry.data.length;

    // Local file header (30 bytes + filename)
    const localHeader = new Uint8Array(30 + filenameBytes.length);
    const view = new DataView(localHeader.buffer);

    view.setUint32(0, 0x04034b50, true); // Local file header signature
    view.setUint16(4, 20, true); // Version needed to extract (2.0)
    view.setUint16(6, 0, true); // General purpose bit flag
    view.setUint16(8, 0, true); // Compression method (0 = stored)
    view.setUint16(10, 0, true); // File last mod time
    view.setUint16(12, 0, true); // File last mod date
    view.setUint32(14, crc, true); // CRC-32
    view.setUint32(18, size, true); // Compressed size
    view.setUint32(22, size, true); // Uncompressed size
    view.setUint16(26, filenameBytes.length, true); // Filename length
    view.setUint16(28, 0, true); // Extra field length
    localHeader.set(filenameBytes, 30);

    parts.push(localHeader);
    parts.push(entry.data);

    // Central directory header (46 bytes + filename)
    const cdHeader = new Uint8Array(46 + filenameBytes.length);
    const cdView = new DataView(cdHeader.buffer);

    cdView.setUint32(0, 0x02014b50, true); // Central file header signature
    cdView.setUint16(4, 20, true); // Version made by
    cdView.setUint16(6, 20, true); // Version needed to extract
    cdView.setUint16(8, 0, true); // Bit flag
    cdView.setUint16(10, 0, true); // Compression method (stored)
    cdView.setUint16(12, 0, true); // Mod time
    cdView.setUint16(14, 0, true); // Mod date
    cdView.setUint32(16, crc, true); // CRC-32
    cdView.setUint32(20, size, true); // Compressed size
    cdView.setUint32(24, size, true); // Uncompressed size
    cdView.setUint16(28, filenameBytes.length, true); // Filename length
    cdView.setUint16(30, 0, true); // Extra field length
    cdView.setUint16(32, 0, true); // File comment length
    cdView.setUint16(34, 0, true); // Disk number start
    cdView.setUint16(36, 0, true); // Internal file attributes
    cdView.setUint32(38, 0, true); // External file attributes
    cdView.setUint32(42, offset, true); // Relative offset of local header
    cdHeader.set(filenameBytes, 46);

    centralDirEntries.push(cdHeader);
    offset += localHeader.length + size;
  }

  const cdOffset = offset;
  let cdSize = 0;
  for (const cd of centralDirEntries) {
    parts.push(cd);
    cdSize += cd.length;
  }

  // End of central directory record (22 bytes)
  const eocd = new Uint8Array(22);
  const eocdView = new DataView(eocd.buffer);
  eocdView.setUint32(0, 0x06054b50, true); // EOCD signature
  eocdView.setUint16(4, 0, true); // Number of this disk
  eocdView.setUint16(6, 0, true); // Disk where central directory starts
  eocdView.setUint16(8, entries.length, true); // Number of central directory records on this disk
  eocdView.setUint16(10, entries.length, true); // Total number of central directory records
  eocdView.setUint32(12, cdSize, true); // Size of central directory
  eocdView.setUint32(16, cdOffset, true); // Offset of start of central directory
  eocdView.setUint16(20, 0, true); // Comment length
  parts.push(eocd);

  return new Blob(parts as BlobPart[], { type: "application/zip" });
}

/**
 * Downloads multiple media items bundled into a structured ZIP archive.
 */
export async function downloadMediaAsZip(
  items: { id: string; title: string; type: string; url: string }[],
  zipFilename = `SIDDWHIZZ_MediaExport_${new Date().toISOString().split("T")[0]}.zip`
): Promise<void> {
  const entries: ZipEntry[] = [];
  const filenameCounts: Record<string, number> = {};

  for (const item of items) {
    try {
      // Determine folder & extension
      let folder = "Images/";
      let ext = ".jpg";
      if (item.type === "video") {
        folder = "Videos/";
        ext = ".mp4";
      } else if (item.type === "audio") {
        folder = "Audio/";
        ext = ".mp3";
      } else if (item.type === "document") {
        folder = "Documents/";
        ext = ".pdf";
      }

      // Clean filename
      let baseName = item.title.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 50);
      if (!baseName.toLowerCase().endsWith(ext)) {
        baseName += ext;
      }

      // Handle duplicate names
      const folderPath = `${folder}${baseName}`;
      if (filenameCounts[folderPath]) {
        filenameCounts[folderPath]++;
        baseName = baseName.replace(new RegExp(`(\\${ext})$`), `_${filenameCounts[folderPath]}$1`);
      } else {
        filenameCounts[folderPath] = 1;
      }

      const fullPath = `${folder}${baseName}`;

      let data: Uint8Array;
      if (item.url.startsWith("data:")) {
        const base64 = item.url.split(",")[1];
        const binary = atob(base64);
        data = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          data[i] = binary.charCodeAt(i);
        }
      } else {
        // Fetch or create text fallback
        try {
          const resp = await fetch(item.url);
          if (resp.ok) {
            const buf = await resp.arrayBuffer();
            data = new Uint8Array(buf);
          } else {
            data = new TextEncoder().encode(`SIDD.WHIZZ Official Asset: ${item.title}\nURL: ${item.url}\nType: ${item.type}`);
          }
        } catch {
          data = new TextEncoder().encode(`SIDD.WHIZZ Official Asset: ${item.title}\nURL: ${item.url}\nType: ${item.type}`);
        }
      }

      entries.push({ filename: fullPath, data });
    } catch (err) {
      console.warn("Failed to package item into zip:", item.title, err);
    }
  }

  if (entries.length === 0) {
    throw new Error("No files could be packaged into the ZIP archive.");
  }

  const zipBlob = createZipBlob(entries);
  const downloadUrl = URL.createObjectURL(zipBlob);
  const a = document.createElement("a");
  a.href = downloadUrl;
  a.download = zipFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}

