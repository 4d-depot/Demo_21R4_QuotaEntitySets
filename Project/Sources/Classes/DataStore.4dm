Class extends DataStoreImplementation



exposed Function authentify($credentials : Object) : Boolean
	
	var $result:=False:C215
	var $user : cs:C1710.UsersEntity
	
	
	$user:=ds:C1482.Users.query("identifier = :1"; $credentials.identifier).first()
	
	If (($user#Null:C1517) && (Verify password hash:C1534($credentials.password; $user.password)))
		
		Session:C1714.setPrivileges("demo")
		
		If ($credentials.identifier="Intern")
			Session:C1714.quotas.nbEntitySets:=3
		End if 
		
		$result:=True:C214
	End if 
	
	return $result
	