import { Workload, expose } from "@threefold/grid_client";
import {
  ArrayNotEmpty,
  IsDefined,
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
  @Expose() @IsString() @IsNotEmpty() @Length(32) key: string;
  @Expose() @IsOptional() @IsString({ each: true }) peers?: string[];

  challenge(): string {
    let out = this.key
    if (!this.peers) return out;
    for (const peer of this.peers) {
      out += peer
    }

    return out
  }
}

export class Znet extends Workload {
  @Export() @IsString() @IsNotEmpty() network_ip_range: string;
  @Export() @IsString() @IsNotEmpty() subnet: string;
  @Export() @IsString() @IsNotEmpty() wg_private_key: string;
  @Export() @IsInt wg_listen_port: number;
  @Export() @Type(()=>Peer) peers: Peer[];
  @Export() @Type(()=>Mycelium) mycelium: Mycelium;


  challenge(): string {
      let out = this.network_ip_range;
      out+= this.subnet;
      out+= this.wg_private_key;
      out+= this.wg_listen_port;
      this.peers.forEach(peer => out += peer.challenge());
      out+= this.mycelium.challenge();
      return out;
  }
}

