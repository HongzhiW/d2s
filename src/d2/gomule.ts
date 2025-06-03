import * as types from "./types";
import { BitWriter } from "../binary/bitwriter";
import * as items from "./items";
import { enhanceItems } from "./attribute_enhancer";
import { BitReader } from "../binary/bitreader";
import { config } from "chai";
import { getConstantData } from "./constants";
import * as const99 from "../data/versions/99_constant_data";

const defaultConfig = {
  extendedStash: false,
} as types.IConfig;

export async function read(
  buffer: Uint8Array,
  constants?: types.IConstantData,
  version?: number | null,
  userConfig?: types.IConfig
): Promise<types.IAtma> {
  const stash = {
    version: 0,
    itemCount: 0,
    items: [],
  } as types.IAtma;
  const reader = new BitReader(buffer);
  const config = Object.assign(defaultConfig, userConfig);
  const firstHeader = reader.ReadUInt32(24);
  reader.SeekByte(0);
  if ((firstHeader & 0x00FFFFFF) == 0x583244) {
    reader.SeekByte(3);
    stash.itemCount = reader.ReadUInt16(16);
    stash.version = reader.ReadUInt16(16);
    reader.SkipBytes(4); // skip checksum
    if (!constants) constants = const99.constants;
    for (let i = 0; i < stash.itemCount; i++) {
      stash.items.push(await items.readItem(reader, stash.version, constants, config, undefined, true));
    }
  }
  return stash;
}
