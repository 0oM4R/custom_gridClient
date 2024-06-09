import { WorkloadDataResult } from "@threefold/grid_client";
import {Expose} from "class-transformer"
import {IsInt, Min, Max} from "class-validator"

export class Zmount {
  /**
   * Disk size in bytes
   */
  @Expose() @IsInt() @Min(100 * 1024 **2) @Max(100*1024**4) size: number;
  challenge():string{
    return this.size.toString()
  }
}

export class ZmountResult extends WorkloadDataResult {
  @Expose() volume_id: string;
}