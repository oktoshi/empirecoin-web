<?php
include("/var/www/html/includes/connect.php");
include("/var/www/html/includes/jsonRPCClient.php");

$empirecoin_rpc = new jsonRPCClient('http://'.$GLOBALS['coin_rpc_user'].':'.$GLOBALS['coin_rpc_password'].'@127.0.0.1:'.$GLOBALS['coin_testnet_port'].'/');

$q = "SELECT * FROM games WHERE game_id='".get_site_constant('primary_game_id')."';";
$r = run_query($q);
$game = mysql_fetch_array($r);

echo walletnotify($game, $empirecoin_rpc, $argv[1]);

$unconfirmed_txs = $empirecoin_rpc->getrawmempool();
echo "Looping through ".count($unconfirmed_txs)." unconfirmed transactions.<br/>\n";
for ($i=0; $i<count($unconfirmed_txs); $i++) {
	walletnotify($game, $empirecoin_rpc, $unconfirmed_txs[$i]);
}

echo "Done!";
?>