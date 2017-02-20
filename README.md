
<h1>About</h1>

|            |                           |  
| ---------- | ------------------------- |  
| Title:     | EthApi        |  
| Author:    | Charonne       |  
| Date:      | 2016-12-29 |  
| Copyright: | Copyright © 2013-2016 Charonne.    |  
| Version:   | 0.1.0      |  


<h1>Instroduction</h1>

Ethapi is a rest Api server used to communicate with an Ethereum node. It allow to store, deploy and execute Ethereum Smart contracts.

<h1>Installation</h1>

<h2>Install packages</h2>
To install, go in the project folder and execute
```
npm install
```

<h2>Config</h2>
Copy the config/config-sample.js to config/config.js

<h2>Launch</h2>
To launch the api, execute
```
pm2 start app.js  --name="ethapi"
```

To delete the api process, execute
```
pm2 delete ethapi
```

<h1>Usage</h1>

<h2>Create a contract</h2>

Create a new contract
```
contracts/create
```
params: { "source": "<contract_source>"}
method: POST

<h2>Deploy a contract</h2>

Deploy a contract
```
contracts/deploy
```
params: { "contract_id": "<contract_id>", "params": [<params>]}
method: POST

<h2>Execute a contract</h2>

Execute a contract
```
contracts/exec
```
params: { "contract_address": "<contract_address>", "params": {<params>}}
method: POST


------------------------------------

Get all contracts

<pre>contracts/</pre>
method: GET


------------------------------------






------------------------------------

Get contract info

<pre>contracts/:contractId</pre>
method: GET 


------------------------------------