import { PAGE_URL } from "@mqtttoolbox/commons";

export async function getPage(): Promise<string> {
    return fetch(PAGE_URL, {
        method: 'GET'
    }).then((response) => {
        return response.text();
    });
}

export async function savePage(content: string): Promise<void> {
    return fetch(PAGE_URL, {
        method: 'POST',
        headers: {
            "Content-Type": "text/html"
        },
        body: content
    }).then(() => {
        // Nothing more to be done, return void
    });
}