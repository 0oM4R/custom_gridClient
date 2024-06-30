import { Workload, expose } from "@threefold/grid_client";
import {
  ArrayNotEmpty,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,

} from "class-validator";
import { Expose, Type } from "class-transformer";
export class Peer {

  @Expose() @IsString() @IsNotEmpty() subnet: string;
  @Expose() @IsString() @IsNotEmpty() wireguard_public_key: string;
  @Expose() @IsString({ each: true }) @ArrayNotEmpty() allowed_ips: string[];
  @Expose() @IsString() endpoint: string;

  challenge(): string {
    let out = this.wireguard_public_key
    out += this.endpoint
    out += this.subnet
    for (const ip of this.allowed_ips) out += ip;

    return out
  }

}

const MyceliumKeyLen = 32
class Mycelium {
  @Expose() @IsString() @IsNotEmpty() @Length(32) hex_key: string;
  @Expose() @IsOptional() @IsString({ each: true }) peers?: string[];

  challenge(): string {
    let out = this.hex_key
    if (!this.peers) return out;
    for (const peer of this.peers) {
      out += peer
    }

    return out
  }
}

export class Znet  {
  @Expose() @IsString() @IsNotEmpty() ip_range: string;
  @Expose() @IsString() @IsNotEmpty() subnet: string;
  @Expose() @IsString() @IsNotEmpty() wireguard_private_key: string;
  @Expose() @IsInt() wireguard_listen_port: number;
  @Expose() @Type(()=>Peer) peers: Peer[];
  @Expose() @Type(()=>Mycelium) mycelium: Mycelium;


  challenge(): string {
      let out = this.ip_range;
      out+= this.subnet;
      out+= this.wireguard_private_key;
      out+= this.wireguard_listen_port;
      this.peers.forEach(peer => out += peer.challenge());
      if(this.mycelium)out+= this.mycelium.challenge();
      return out;
  }
}

