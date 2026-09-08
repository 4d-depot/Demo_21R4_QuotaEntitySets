//%attributes = {}


var $credentials : cs:C1710.CredentialsEntity
var $status : Object



$credentials:=ds:C1482.Credentials.new()

$credentials.identifier:="Intern"
$credentials.password:=Generate password hash:C1533("a")
$status:=$credentials.save()


$credentials:=ds:C1482.Credentials.new()

$credentials.identifier:="Admin"
$credentials.password:=Generate password hash:C1533("a")
$status:=$credentials.save()