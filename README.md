'''EthApi'''

<h1>Installation</h1>

<h2>Install packages</h2>
To install, go in the project folder and execute
<pre>
npm install
</pre>

<h2>Config</h2>
Copy the config/config-sample.js to config/config.js

<h1>Usage</h1>

<h2>Create a contract</h2>

Create a new contract
<pre>contracts/create</pre>
params: { "source": "<contract_source>"}
method: POST

<h2>Deploy a contract</h2>

Deploy a contract
<pre>contracts/deploy</pre>
params: { "contract_id": "<contract_id>", "params": [<params>]}
method: POST

<h2>Execute a contract</h2>

Execute a contract
<pre>contracts/exec</pre>
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