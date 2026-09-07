//%attributes = {}




#DECLARE($obj : Object) : Object

var $result:={}
var $prop : Text


If (OB Instance of:C1731($obj; 4D:C1709.QuotaManager))
	For each ($prop; $obj)
		$result[$prop]:=$obj[$prop]
	End for each 
End if 

return $result