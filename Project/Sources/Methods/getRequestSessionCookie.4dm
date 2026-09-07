//%attributes = {}


#DECLARE($request : 4D:C1709.HTTPRequest) : Text

var $cookies : Collection
var $cookie : Text
var $start; $end : Integer


If ($request.response.status=200)
	
	If (Value type:C1509($request.response.headers["set-cookie"])=Is collection:K8:32)
		$cookies:=$request.response.headers["set-cookie"]
		$cookie:=$cookies.find(Formula:C1597((Position:C15("4DSID_HDI_REST_Server_quotas"; $1.value)#0)))
	Else 
		$cookie:=$request.response.headers["set-cookie"]
	End if 
	
	$start:=Position:C15("4DSID_HDI_REST_Server_quotas"; $cookie)
	$end:=Position:C15(";"; $cookie; $start)
	
	return Substring:C12($cookie; $start; $end-$start)
	
End if 
