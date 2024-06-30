import { ComputeCapacity, MachineModel, Workload, WorkloadTypes, TFClient,SignatureRequest,SignatureRequirement, Deployment, KeypairType } from "@threefold/grid_client";
import {Client} from "@threefold/rmb_direct_client"
import { MachineInterface, MachineMount, MachineNetwork, ZMachine } from "./zmachine";
import { Zmount } from "./zmount";
import { Znet } from "./network";

//machine network
const network = new MachineNetwork()
network.planetary = true;
const inf = new MachineInterface();
inf.ip = "10.20.2.2";
inf.network = "kassemnet"
network.interfaces = [inf]
network.public_ip= '';


// machine mounts
const mount = new MachineMount()
mount.mountpoint = "/test"
mount.name = "testing"

// machine compute capacity 
const computeCapacity= new ComputeCapacity()
computeCapacity.cpu = 1
computeCapacity.memory = 4  * 1024 ** 3

const machine = new ZMachine()

machine.flist = "https://hub.grid.tf/tf-official-vms/ubuntu-23.10-mycelium.flist"
machine.network = network;

machine.size = 12 * 1024 ** 3;
machine.mounts = [mount];
machine.compute_capacity = computeCapacity
machine.entrypoint = "/sbin/zinit init"
machine.env = 
  {"SSH_KEY": "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQDKkaopr/tRilmLprntgqAO6JxnhzhrrB02KeUsNys9qj/G4RtXK4hKZo3yj42Kuoub53TxoW/BfZSRUbY0VNUgZSsifCyDE4g1UXi83ic+uepPb1VIfzlFdtZPUo/dEtjfS5FM7GVAPZCDik08w2+uXeZiAKavLTDQFh2cuIqE5QnQ44enODTMkSDPVJSKJ6NSoNcrY2I++AtcxgNFzy/7YWoT/bA19CliGqxBMSQ/GjOEAF3iQjUPc5LYcqCYAc0Y6WPt2l8uEVvhJAtsLelGApt8v/Nq/OBEKJpUQB2cfkyKlwLLphKFtQ8gcKjrbpE47lVsfbW68uqCw/5avA71HlS6AXxMeda8GZ99UqDTOLoUbd+EEo17hiHs6Nvle8DHNfWdGT2wx+DhzZeCO719UadmQxFLYDd75dDH5gLkMxr9JXPWDqdxvsyMZilxZPk3UQbK811obYSMrc9L+u8vwLs0weUBxnygutnU0eF9cRQxFgx3zOOfwI1ugI9SgSU= omarkassem099@gmail.com"}


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
znet.ip_range = "10.20.0.0/16"
znet.wireguard_private_key= "aVEE91I/ft3M4zsnVVAwAD+F3vaU9BkDkWwGE/JRxKw="
znet.wireguard_listen_port = 1372
znet.peers = []

const networkWorkload = new Workload()

networkWorkload.name ="kassemnet"
networkWorkload.version = 0
networkWorkload.type = WorkloadTypes.network
networkWorkload.metadata=""
networkWorkload.description="kassem cusstom client network"
networkWorkload.data = znet



const signature_request = new SignatureRequest()
signature_request.twin_id = 800;
signature_request.weight = 1;
signature_request.required = false;

const signature_requirement = new SignatureRequirement();
signature_requirement.weight_required = 1
signature_requirement.requests = [signature_request];


const deployment = new Deployment();

deployment.version = 0;
deployment.twin_id = 800;
deployment.metadata = "";
deployment.description = "";
deployment.expiration = 0;
deployment.workloads = [
  // networkWorkload,
  // diskWorkload,
  vm
]
deployment.signature_requirement = signature_requirement
const mnemonic = 'acoustic apology father noble strike brass print denial language effort measure carbon'
const tfchainUrl = "wss://tfchain.dev.grid.tf/ws"
const relayUrl = "wss://relay.dev.grid.tf"

async function main() {
  const hash = deployment.challenge_hash();
  const tfClient = new TFClient(tfchainUrl, mnemonic, mnemonic, KeypairType.sr25519);
  await tfClient.connect()

  const node_twinId = (await tfClient.nodes.get({id: 166})).twinId
  const contract = await (await tfClient.contracts.createNode({ hash, solutionProviderId: 1, numberOfPublicIps: 0, nodeId: 166, data: JSON.stringify({ "version": 3, "type": "vm", "name": "kassemvm", "projectName": "vm/kassemvm" }) })).apply();
  deployment.contract_id = contract.contractId;
  await deployment.sign(800, mnemonic,KeypairType.sr25519);
  // console.log(deployment.si)

  const rmb_client = new Client(tfchainUrl, relayUrl, mnemonic, "kassem", KeypairType.sr25519, 3);
  await rmb_client.connect();

  const deployedMsgId = await rmb_client.send("zos.deployment.deploy", JSON.stringify(deployment),node_twinId,1,3);
  const deployReplay = await rmb_client.read(deployedMsgId)
  console.log(deployReplay);

  console.log("Waiting for deployment to be ready!")
  await new Promise(r=> setTimeout(r,10000))

  const getMsg = await rmb_client.send("zos.deployment.get", JSON.stringify({"contract_id": contract.contractId}), node_twinId, 1, 3);
  const msgReplay = await rmb_client.read(getMsg);

  console.log(msgReplay)

  await tfClient.disconnect()
  await rmb_client.disconnect()
}
main()