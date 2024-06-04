import { Workload, expose } from "@threefold/grid_client";
import {
  ArrayNotEmpty,
  IsDefined,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from "class-validator";
import { Expose, Type } from "class-transformer";
class Peer {
 
  @Expose() @IsString() @IsNotEmpty() subnet: string;
  @Expose() @IsString() @IsNotEmpty() wireguard_public_key: string;
  @Expose() @IsString({each: true}) @ArrayNotEmpty() allowed_ips: string[];
  @Expose() @IsString() endpoint: string;

  challenge(): string{
    let out = this.wireguard_public_key
    out+= this.endpoint
    out+= this.subnet
    for(const ip of this.allowed_ips) out+= ip;
    
    return out
  }

}