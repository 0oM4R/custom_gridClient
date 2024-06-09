import { ComputeCapacity, MachineModel, Workload, WorkloadTypes } from "@threefold/grid_client";
import { MachineInterface, MachineMount, MachineNetwork, ZMachine } from "./zmachine";
import { Zmount } from "./zmount";
import { Znet } from "./network";

//machine network
const network = new MachineNetwork()
network.planetary = true;
const inf = new MachineInterface();
inf.ip = "10.20.2.2";
inf.network = "kassemnet"
network.Interfaces = [inf]
network.public_ip= '';


// machine mounts
const mount = new MachineMount()
mount.mountpoint = "/test"
mount.name = "testing"

// machine compute capacity 
const computeCapacity= new ComputeCapacity()
computeCapacity.cpu =1
computeCapacity.memory = 4  * 1024 ** 3

const machine = new ZMachine()

machine.flist = "https://hub.grid.tf/tf-official-vms/ubuntu-23.10-mycelium.flist"
machine.network = network;

machine.size = 32 * 1024 ** 2;
machine.mounts = [mount];
machine.computeCapacity = computeCapacity
machine.entrypoint = "/sbin/zinit init"
machine.env = [
  {"SSH_KEY": "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQDKkaopr/tRilmLprntgqAO6JxnhzhrrB02KeUsNys9qj/G4RtXK4hKZo3yj42Kuoub53TxoW/BfZSRUbY0VNUgZSsifCyDE4g1UXi83ic+uepPb1VIfzlFdtZPUo/dEtjfS5FM7GVAPZCDik08w2+uXeZiAKavLTDQFh2cuIqE5QnQ44enODTMkSDPVJSKJ6NSoNcrY2I++AtcxgNFzy/7YWoT/bA19CliGqxBMSQ/GjOEAF3iQjUPc5LYcqCYAc0Y6WPt2l8uEVvhJAtsLelGApt8v/Nq/OBEKJpUQB2cfkyKlwLLphKFtQ8gcKjrbpE47lVsfbW68uqCw/5avA71HlS6AXxMeda8GZ99UqDTOLoUbd+EEo17hiHs6Nvle8DHNfWdGT2wx+DhzZeCO719UadmQxFLYDd75dDH5gLkMxr9JXPWDqdxvsyMZilxZPk3UQbK811obYSMrc9L+u8vwLs0weUBxnygutnU0eF9cRQxFgx3zOOfwI1ugI9SgSU= omarkassem099@gmail.com"}
]

machine.corex = false

const vm = new Workload()
vm.name = "kassemclient"
vm.version = 0;
vm.type = WorkloadTypes.zmachine
vm.data = machine
vm.description= "this vm is deployed from kassem custom client"
vm.metadata = ""

// disk workload

const disk = new Zmount()
disk.size = 10 * 1024* 10**3;

const diskWorkload = new Workload()
diskWorkload.name = "kassemdisk"
diskWorkload.version = 0;
diskWorkload.type = WorkloadTypes.zmount
diskWorkload.data = disk;
diskWorkload.metadata ="";
diskWorkload.description="";



// network workload
const znet = new Znet()
znet.subnet = "10.20.2.0/24"
znet.network_ip_range = "10.20.0.0/16"
znet.wg_private_key= "aVEE91I/ft3M4zsnVVAwAD+F3vaU9BkDkWwGE/JRxKw="
znet.wg_listen_port = 1372
znet.peers = []

const networkWorkload = new Workload()

networkWorkload.name ="kassemnet"
networkWorkload.version = 0
networkWorkload.type = WorkloadTypes.network
networkWorkload.metadata=""
networkWorkload.description="kassem cusstom client network"
networkWorkload.data = znet