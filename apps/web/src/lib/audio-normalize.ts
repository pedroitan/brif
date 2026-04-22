import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

/**
 * Detecta o formato real do arquivo a partir dos magic bytes,
 * independente da extensão declarada.
 */
export type DetectedFormat =
  | 'mp3'
  | 'mp4' // m4a real (MP4 container)
  | 'adts-aac' // raw ADTS AAC (com falso .m4a)
  | 'wav'
  | 'ogg'
  | 'flac'
  | 'webm'
  | 'unknown';

export function detectAudioFormat(buffer: Buffer): DetectedFormat {
  if (buffer.length < 12) return 'unknown';

  // MP3: ID3 tag ou frame sync (0xFFEx)
  const b1 = buffer[1] ?? 0;
  if (buffer[0] === 0x49 && b1 === 0x44 && buffer[2] === 0x33) return 'mp3';
  if (buffer[0] === 0xff && (b1 & 0xe0) === 0xe0) {
    // Pode ser MP3 ou ADTS AAC. ADTS tem byte[1] & 0xF6 = 0xF0 (sync + layer=0)
    // MP3 tem layer != 0
    const layer = (b1 >> 1) & 0x03;
    if (layer === 0) return 'adts-aac';
    return 'mp3';
  }

  // MP4/M4A: ftyp box nos bytes 4-7
  if (
    buffer[4] === 0x66 &&
    buffer[5] === 0x74 &&
    buffer[6] === 0x79 &&
    buffer[7] === 0x70
  ) {
    return 'mp4';
  }

  // WAV: RIFF...WAVE
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x41 &&
    buffer[10] === 0x56 &&
    buffer[11] === 0x45
  ) {
    return 'wav';
  }

  // OGG: OggS
  if (
    buffer[0] === 0x4f &&
    buffer[1] === 0x67 &&
    buffer[2] === 0x67 &&
    buffer[3] === 0x53
  ) {
    return 'ogg';
  }

  // FLAC: fLaC
  if (
    buffer[0] === 0x66 &&
    buffer[1] === 0x4c &&
    buffer[2] === 0x61 &&
    buffer[3] === 0x43
  ) {
    return 'flac';
  }

  // WebM/Matroska: EBML header (0x1A45DFA3)
  if (
    buffer[0] === 0x1a &&
    buffer[1] === 0x45 &&
    buffer[2] === 0xdf &&
    buffer[3] === 0xa3
  ) {
    return 'webm';
  }

  return 'unknown';
}

/**
 * Faz remux (sem reencoding) de um stream AAC cru para um container M4A real.
 */
export async function remuxAdtsAacToM4a(buffer: Buffer): Promise<Buffer> {
  const tmp = tmpdir();
  const id = randomUUID();
  const inputPath = path.join(tmp, `${id}.aac`);
  const outputPath = path.join(tmp, `${id}.m4a`);

  await fs.writeFile(inputPath, buffer);

  try {
    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions(['-c copy', '-movflags +faststart'])
        .format('mp4')
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .save(outputPath);
    });

    return await fs.readFile(outputPath);
  } finally {
    await Promise.allSettled([fs.unlink(inputPath), fs.unlink(outputPath)]);
  }
}

/**
 * Normaliza um upload de áudio para formato aceito pelo Whisper.
 * - Detecta o conteúdo real (ignora extensão)
 * - Se for raw AAC (falso .m4a), remuxa para MP4/M4A
 * - Caso contrário retorna os bytes originais
 *
 * Retorna também `filename` e `mime` corrigidos.
 */
export async function normalizeAudioForWhisper(
  rawName: string,
  buffer: Buffer,
): Promise<{ buffer: Buffer; filename: string; mime: string; detected: DetectedFormat }> {
  const detected = detectAudioFormat(buffer);
  const safeBase =
    rawName
      .replace(/\.[a-z0-9]+$/i, '')
      .replace(/[^a-zA-Z0-9-_]+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '') || 'audio';

  switch (detected) {
    case 'adts-aac': {
      const remuxed = await remuxAdtsAacToM4a(buffer);
      return {
        buffer: remuxed,
        filename: `${safeBase}.m4a`,
        mime: 'audio/mp4',
        detected,
      };
    }
    case 'mp3':
      return { buffer, filename: `${safeBase}.mp3`, mime: 'audio/mpeg', detected };
    case 'mp4':
      return { buffer, filename: `${safeBase}.m4a`, mime: 'audio/mp4', detected };
    case 'wav':
      return { buffer, filename: `${safeBase}.wav`, mime: 'audio/wav', detected };
    case 'ogg':
      return { buffer, filename: `${safeBase}.ogg`, mime: 'audio/ogg', detected };
    case 'flac':
      return { buffer, filename: `${safeBase}.flac`, mime: 'audio/flac', detected };
    case 'webm':
      return { buffer, filename: `${safeBase}.webm`, mime: 'audio/webm', detected };
    default:
      throw new Error(
        'Formato de áudio não reconhecido. Use MP3, M4A, WAV, MP4, WebM, OGG ou FLAC.',
      );
  }
}
