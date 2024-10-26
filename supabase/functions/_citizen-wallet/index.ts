import { CommunityConfig } from "jsr:@citizenwallet/sdk";
import { formatUnits } from "npm:ethers";

import communityJson from "./community.json" with {
    type: "json",
};

export interface Notification {
    title: string;
    body: string;
}

export interface ERC20TransferData {
    from: string;
    to: string;
    value: string;
}

export const communityConfig = () => {
    return new CommunityConfig(communityJson);
};

export const createERC20TransferNotification = (
    config: CommunityConfig,
    data: ERC20TransferData,
): Notification => {
    const community = config.community;
    const token = config.primaryToken;

    const value = formatUnits(data.value, token.decimals);

    return {
        title: community.name,
        body: `${value} ${token.symbol} received`,
    };
};
