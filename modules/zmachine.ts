import { Expose, Type } from "class-transformer"
import { IsString, IsInt, IsIP, IsNotEmpty, ValidateNested, IsBoolean, Min, Max } from "class-validator"

export class MachineInterface {
  @Expose() @IsString() @IsNotEmpty() network: string;
  @Expose() @IsIP ip: string;

  challenge(): string {
    let out = this.network;
    out += this.ip;
    return out
  }
}

export class MyceliumIP {
  @Expose() @IsString() @IsNotEmpty() network: string;
  @Expose() @IsString() hex_seed: string;

  challenge(): string {
    let out = this.network;
    out += this.hex_seed;
    return out;
  }
}

export class MachineNetwork {
  @Expose() @IsString() @IsNotEmpty public_ip: string;
  @Expose() @IsBoolean() planetary: boolean;
  @Expose() @Type(() => MyceliumIP) mycelium: MyceliumIP;
  @Expose() @Type(() => MachineInterface) @ValidateNested() Interfaces: MachineInterface[]

  readonly challenge(): string {
    let out = this.public_ip;
    out += this.planetary.toString()
    this.Interfaces.forEach(inter => out += inter.challenge)
    out += this.mycelium.challenge();
    return out;
  }
}

export class MachineCapacity {
  @Expose() @IsInt() @Min(1) @Max(32) cpu: number;
  /**
   * Memory in Bytes
   */
  @Expose() @IsInt() @Min(256 * 1024 ** 2) @Max(256 * 1024 * 3) memory: number;

  challenge(): string {
    let out = this.cpu.toString();
    out += this.memory.toString();
    return out;
  }

}

export class MachineMount {
  @Expose() @IsString() @IsNotEmpty() name: string;
  @Expose() @IsString() @IsNotEmpty() mountpoint: string;

  challenge(): string {
    let out = this.name;
    out += this.mountpoint;
    return out
  }
}

export class ZMachine {
  @Expose() @IsString() @IsNotEmpty() flist: string;
  @Expose() @Type(()=> MachineNetwork) @ValidateNested() network: MachineNetwork;
  /**
   * disk size in bytes
   */
  @Expose() @IsInt() @Max(256*1024**4) size: number;
  @Expose() @Type(()=> MachineCapacity) @ValidateNested() computeCapacity: MachineCapacity;
  @Expose() @Type(()=> MachineMount) @ValidateNested({each:true}) mounts: MachineMount[];
  @Expose() entrypoint: string;
  @Expose() env: Record<string, any>
  @Expose() @IsBoolean corex: boolean;

  challenge(): string {
    let out = this.flist;
    out+= this.network.challenge()
    out+= this.size
    out+= this.computeCapacity.challenge()
    this.mounts.forEach(mount=> out+=mount.challenge())
    out+= this.entrypoint
    for(const key of Object.keys(this.env).sort()){
      out+= key;
      out+= "=";
      out+= this.env[key]
    }
    out+= this.corex
    return out;
  }

}