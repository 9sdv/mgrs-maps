<?php

class dbManager{
	private $myUser;
	private $myPass;
	private $myDatabseName;
	private $myHost;
	
	private $db;

	function __construct($database, $user='root', $pass='', $host='127.0.0.1:3306')
	{
		$this->myDatabaseName = $database;
		$this->myUser = $user;
		$this->myPass = $pass;
		$this->myHost = $host;
		
		print "-- ".$database."\n";
		
		$this->db = new PDO("mysql:host=$host;dbname=$database", $user, $pass);
	}
	
	function insert($table, $entity, $attribute, $value) 
	{
		$sql = "INSERT INTO $table SET entity='$entity',attribute='$attribute',value='$value'";
		print $sql."\n";
		print $this->db->exec($sql);
	}
	
}

//$writer = new dbManager('maps_data');
//$writer->insert('polylines','entity','attribute','value');

?>
