//%attributes = {}


#DECLARE($request : 4D:C1709.HTTPRequest)


If (Storage:C1525.session.cookie=Null:C1517)
	
	Use (Storage:C1525.session)
		Storage:C1525.session.cookie:=getRequestSessionCookie($request)
	End use 
	
End if 