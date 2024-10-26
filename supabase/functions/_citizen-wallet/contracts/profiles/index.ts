import {
    type CommunityConfig,
    formatProfileImageLinks,
    type Profile,
} from "jsr:@citizenwallet/sdk";
import { Contract, JsonRpcProvider } from "npm:ethers";
import profileAbi from "./Profile.abi.json" with {
    type: "json",
};
import { downloadJsonFromIpfs } from "../../ipfs/index.ts";

export const getProfileFromId = async (
    config: CommunityConfig,
    id: string,
): Promise<Profile | undefined> => {
    const rpc = new JsonRpcProvider(config.primaryRPCUrl);

    const contract = new Contract(
        config.community.profile.address,
        profileAbi,
        rpc,
    );

    try {
        const address: string = await contract.getFunction("fromIdToAddress")(
            id,
        );

        const uri: string = await contract.getFunction("tokenURI")(address);

        const profile = await downloadJsonFromIpfs<Profile>(uri);

        const baseUrl = Deno.env.get("IPFS_URL");
        if (!baseUrl) {
            throw new Error("IPFS_URL is not set");
        }

        return formatProfileImageLinks(baseUrl, profile);
    } catch (error) {
        console.error("Error fetching profile:", error);
        return;
    }
};
