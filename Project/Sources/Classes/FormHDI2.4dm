

property updateQuotaURL; getAllQuotasURL; createEntitySetURL; releaseEntitySetURL : Text
property resetAllQuotasURL; createEntitySet20SecondsURL; createEntitySet50SecondsURL : Text
property createEntitySetResponse : Text
property quotaBody; entitySets; releaseBody : Collection
property nbEntitySets; responseStatus; defaultTimeout; maxTimeout : Integer
property quotas : Object


Class constructor
	
Function formEventHandler($formEventCode : Integer)
	
	Case of 
		: ($formEventCode=On Load:K2:1)
			
			btnTrace:=False:C215
			
			InitInfo
			
			This:C1470.updateQuotaURL:="http://127.0.0.1/rest/$singleton/QuotasUtilities/setQuotaValue"
			This:C1470.getAllQuotasURL:="http://127.0.0.1/rest/$singleton/QuotasUtilities/getQuotas"
			
			This:C1470.createEntitySetURL:="http://127.0.0.1/rest/People?$method=entityset"
			This:C1470.releaseEntitySetURL:="http://127.0.0.1/rest/$entityset/$release"
			
			This:C1470.nbEntitySets:=3
			This:C1470.quotaBody:=["nbEntitySets"; This:C1470.nbEntitySets]
			
			This:C1470.resetAllQuotasURL:="http://127.0.0.1/rest/$singleton/QuotasUtilities/resetAllQuotas"
			
			This:C1470.entitySets:=New collection:C1472()
			
			This:C1470.releaseAllEntitySets()
			This:C1470.resetAllQuotas()
			This:C1470.refreshQuotas()
			
			OBJECT SET ENABLED:C1123(*; "CreateEntitySetButton"; False:C215)
			This:C1470.handleReleaseButton()
			
			manageTexts
			
			
		: ($formEventCode=On Page Change:K2:54)
			
			manageTexts
			
			This:C1470.releaseAllEntitySets()
			This:C1470.resetAllQuotas()
			This:C1470.refreshQuotas()
			
			This:C1470.defaultTimeout:=20
			This:C1470.maxTimeout:=40
			
			This:C1470.createEntitySet20SecondsURL:="http://127.0.0.1/rest/People?$method=entityset&$timeout=10"
			This:C1470.createEntitySet50SecondsURL:="http://127.0.0.1/rest/People?$method=entityset&$timeout=50"
			
			This:C1470.entitySets:=New collection:C1472()
			
			OBJECT SET ENABLED:C1123(*; "CreateEntitySetButton"; False:C215)
			This:C1470.handleReleaseButton()
			
			
		: ($formEventCode=On Close Box:K2:21)
			// comportement de fermeture si nécessaire
			If (Is Windows:C1573 && Application info:C1599().SDIMode)
				QUIT 4D:C291
			Else 
				CANCEL:C270
			End if 
	End case 
	
	
	
Function updateQuotaValue($what : Text)
	
	var $request : 4D:C1709.HTTPRequest
	
	Case of 
		: ($what="nbEntitySets")
			
			This:C1470.quotaBody:=[$what; This:C1470.nbEntitySets]
			$request:=This:C1470.runRequest(This:C1470.updateQuotaURL; HTTP POST method:K71:2; This:C1470.quotaBody)
			
			OBJECT SET ENABLED:C1123(*; "CreateEntitySetButton"; True:C214)
			
		: ($what="defaultEntitySetTimeout")
			
			This:C1470.quotaBody:=[$what; This:C1470.defaultTimeout]
			$request:=This:C1470.runRequest(This:C1470.updateQuotaURL; HTTP POST method:K71:2; This:C1470.quotaBody)
			
		: ($what="maxEntitySetTimeout")
			
			This:C1470.quotaBody:=[$what; This:C1470.maxTimeout]
			$request:=This:C1470.runRequest(This:C1470.updateQuotaURL; HTTP POST method:K71:2; This:C1470.quotaBody)
			
	End case 
	
	This:C1470.quotas:=$request.response.body
	
	
Function runRequest($url : Text; $verb : Text; $body : Collection) : 4D:C1709.HTTPRequest
	
	var $request : 4D:C1709.HTTPRequest
	var $headers; $requestObj : Object
	
	
	$headers:=buildHeaders
	$requestObj:={method: $verb; headers: $headers}
	
	If ($body#Null:C1517)
		$requestObj.body:=$body
	End if 
	
	$request:=4D:C1709.HTTPRequest.new($url; $requestObj).wait()
	handleSessionCookie($request)
	
	return $request
	
	
Function createEntitySet()
	
	var $request : 4D:C1709.HTTPRequest
	var $entitySetTemp; $entityset : Text
	var $index : Integer
	
	
	$request:=This:C1470.runRequest(This:C1470.createEntitySetURL; HTTP GET method:K71:1)
	
	This:C1470.responseStatus:=$request.response.status
	
	If ($request.response.body.__ERROR=Null:C1517)
		$entitySetTemp:=$request.response.body.__ENTITYSET
		
		$index:=Position:C15("$entityset"; $entitySetTemp)
		$index+=11
		
		$entityset:=Substring:C12($entitySetTemp; $index)
		This:C1470.entitySets.push($entityset)
		
	End if 
	Form:C1466.createEntitySetResponse:=JSON Stringify:C1217($request.response.body; *)
	
	This:C1470.handleReleaseButton()
	This:C1470.refreshQuotas()
	
	
Function releaseEntitySet($entitySetId : Text)
	
	var $request : 4D:C1709.HTTPRequest
	
	
	This:C1470.releaseBody:=New collection:C1472()
	This:C1470.releaseBody.push($entitySetId)
	
	$request:=This:C1470.runRequest(This:C1470.releaseEntitySetURL; HTTP POST method:K71:2; This:C1470.releaseBody)
	
	This:C1470.entitySets:=This:C1470.getAllEntitySets()
	
	If (This:C1470.entitySets.length=0)
		OBJECT SET ENABLED:C1123(*; "ReleaseEntitySetButton"; False:C215)
	End if 
	
	This:C1470.refreshQuotas()
	
	
Function getAllEntitySets() : Collection
	
	var $request : 4D:C1709.HTTPRequest
	var $obj : Object
	var $id : Text
	var $result:=New collection:C1472()
	
	
	$request:=This:C1470.runRequest("http://127.0.0.1/rest/$info"; HTTP POST method:K71:2)
	
	If ($request.response.body.entitySet#Null:C1517)
		For each ($obj; $request.response.body.entitySet)
			$id:=$obj.id
			$result.push($id)
		End for each 
	End if 
	
	return $result
	
	
Function refreshQuotas()
	
	var $request : 4D:C1709.HTTPRequest
	
	$request:=This:C1470.runRequest(This:C1470.getAllQuotasURL; HTTP GET method:K71:1)
	
	This:C1470.quotas:=$request.response.body
	
	
Function resetAllQuotas()
	
	var $request : 4D:C1709.HTTPRequest
	
	$request:=This:C1470.runRequest(This:C1470.resetAllQuotasURL; HTTP POST method:K71:2)
	
	
Function releaseAllEntitySets()
	
	var $request : 4D:C1709.HTTPRequest
	var $entitySets : Collection
	
	
	$entitySets:=This:C1470.getAllEntitySets()
	$request:=This:C1470.runRequest(This:C1470.releaseEntitySetURL; HTTP POST method:K71:2; $entitySets)
	
	This:C1470.refreshQuotas()
	
	
Function handleReleaseButton()
	
	OBJECT SET ENABLED:C1123(*; "ReleaseEntitySetButton"; Form:C1466.entitySetIndex#0)
	
	
	
Function createEntitySetWithTimeout($timeout : Integer)
	
	var $request : 4D:C1709.HTTPRequest
	var $entitySetTemp; $entitySetId; $lifeTime : Text
	var $index : Integer
	
	Case of 
		: ($timeout=0)
			$request:=This:C1470.runRequest(This:C1470.createEntitySetURL; HTTP GET method:K71:1)
			
		: ($timeout=20)
			$request:=This:C1470.runRequest(This:C1470.createEntitySet20SecondsURL; HTTP GET method:K71:1)
			
		: ($timeout=50)
			$request:=This:C1470.runRequest(This:C1470.createEntitySet50SecondsURL; HTTP GET method:K71:1)
			
	End case 
	
	$entitySetTemp:=$request.response.body.__ENTITYSET
	
	$index:=Position:C15("$entityset"; $entitySetTemp)
	$index+=11
	
	$entitySetId:=Substring:C12($entitySetTemp; $index)
	
	$lifeTime:=This:C1470.getEntitySetLifeTime($entitySetId; $timeout)
	
	This:C1470["lifeTime"+String:C10($timeout)]:=$lifeTime
	
	This:C1470.refreshQuotas()
	
	
	
Function getEntitySetLifeTime($id : Text; $timeout : Integer) : Text
	
	var $url : Text
	var $request : 4D:C1709.HTTPRequest
	var $coll : Collection
	var $entitySet : Object
	var $delta : Time
	
	
	$url:="http://127.0.0.1/rest/info"
	
	$request:=This:C1470.runRequest("http://127.0.0.1/rest/$info"; HTTP POST method:K71:2)
	
	If ($request.response.body.entitySet#Null:C1517)
		
		$coll:=$request.response.body.entitySet.query("id = :1"; $id)
		
		If ($coll.length>=1)
			$entitySet:=$coll.first()
			This:C1470["entitySet"+String:C10($timeout)]:=$entitySet
		End if 
	End if 
	
	$delta:=Time:C179($entitySet.expires)-Time:C179($entitySet.refreshed)
	
	return Time string:C180($delta)
	
	
	
	
	
	
	
	
	