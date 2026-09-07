//%attributes = {}


#DECLARE() : Object

var $result:=New object:C1471()


If (Storage:C1525.session.cookie#"")
	$result["Cookie"]:=Storage:C1525.session.cookie
Else 
	$result["Cookie"]:=""
End if 

return $result