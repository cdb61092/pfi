import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { useTellerConnect } from 'teller-connect-react';
import React from "react";
import https from "https";
import fs from "fs"
import { json } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function action({request}: ActionFunctionArgs) {
    const formData = await request.formData()
    const accessToken = formData.get('accessToken')

    const username = 'token_'
    const password = ''; // Leave empty if not used

    const httpsAgent = new https.Agent({
                                           cert: fs.readFileSync('certificate.pem'),
                                           key: fs.readFileSync('private_key.pem'),
                                       });

    const base64Credentials = Buffer.from(`${username}:${password}`).toString('base64');


    // if (!accessToken) {
    //     throw new Error("Access token is required");
    // }

    const options = {
        hostname: 'api.teller.io',
        port: 443,
        method: 'GET',
        path: '/',
        agent: httpsAgent,
        headers: {
            'Authorization': `Basic ${base64Credentials}`,
            'Content-Type': 'application/json',
        }
        // If your certificate has a passphrase, include it as well
        // passphrase: 'your passphrase here',
    };

    console.log('before request')
    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            console.log(JSON.parse(data));
        });
    });

    req.on('error', (e) => {
        console.error(e);
    });

    req.end()

    // const options = {
    //     hostname: 'api.teller.io',
    //     port: 443,
    //     method: 'GET',
    //     path: '/accounts',
    //     agent: httpsAgent,
    //     headers: {
    //         'Authorization': `Basic ${base64Credentials}`,
    //         'Content-Type': 'application/json',
    //     }
    //     // If your certificate has a passphrase, include it as well
    //     // passphrase: 'your passphrase here',
    // };
    //
    // console.log('before request')
    // const req = https.request(options, (res) => {
    //     let data = '';
    //     res.on('data', (chunk) => {
    //         data += chunk;
    //     });
    //
    //     res.on('end', () => {
    //         console.log(JSON.parse(data));
    //     });
    // });
    //
    // req.on('error', (e) => {
    //     console.error(e);
    // });
    //
    // req.end()


    return null
}

export async function loader() {
    return json(
        { hello: "world" },
        {
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
        }
    );
}

export default function Index() {
    const [accessToken, setAccessToken] = React.useState<string>('');
    console.log('accessToken', accessToken)
  const { open, ready } = useTellerConnect({
                                               applicationId: "app_oi4j2994sakqmksbkg000",
                                                environment: "development",
                                             onSuccess: (authorization) => {
                                               // Save your access token here
                                                 setAccessToken(authorization.accessToken)
                                             }
                                           });


  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>Welcome to Remix</h1>
        <button onClick={() => open()}>
            Connect a bank account
        </button>
        <Form method="post">
            <input type="submit" name="accessToken" value={accessToken} disabled={!ready} />
        </Form>
    </div>
  );
}
