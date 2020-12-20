import { PAGE_URL } from "@mqtttoolbox/commons";

export async function getPage(): Promise<string> {
    return fetch(PAGE_URL, {
        method: 'GET'
    }).then((response) => {
        return response.text();
    });
}

export async function savePage(content: string): Promise<void> {

}