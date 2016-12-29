<h1>EthApi</h1>


------------------------------------

Get all contracts

<pre>contracts/</pre>
method: GET


------------------------------------

Create a new contract

<pre>contracts/insert</pre>
params: { "source": "<contract_source>"}
method: POST


------------------------------------

Deploy a contract

<pre>contracts/deploy</pre>
params: { "contract_address": "<contract_address>", "params": {<params>}}
method: POST


------------------------------------

Execute a contract

<pre>contracts/exec</pre>
params: { "contract_address": "<contract_address>", "params": {<params>}}
method: POST


------------------------------------

Get contract info

<pre>contracts/:contractId</pre>
method: GET 


------------------------------------