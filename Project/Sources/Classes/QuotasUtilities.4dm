

shared singleton Class constructor
	
	
	
exposed onHTTPGet Function getQuotas() : Object
	
	ASSERT:C1129(OB Instance of:C1731(Session:C1714.quotas; 4D:C1709.QuotaManager))
	
	return copyNonStreamableObject(Session:C1714.quotas)
	
	
exposed Function setQuotaValue($prop : Text; $value : Integer) : Object
	
	If (btnTrace)
		TRACE:C157
	End if 
	
	Session:C1714.quotas[$prop]:=$value
	
	return copyNonStreamableObject(Session:C1714.quotas)
	
	
exposed Function resetAllQuotas() : Object
	
	var $coll : Collection
	var $prop : Text
	
	
	$coll:=OB Keys:C1719(Session:C1714.quotas)
	
	For each ($prop; $coll)
		Session:C1714.quotas[$prop]:=Null:C1517
	End for each 
	
	return copyNonStreamableObject(Session:C1714.quotas)
	
	
	