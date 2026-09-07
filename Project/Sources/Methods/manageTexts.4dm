//%attributes = {}




var $i; $n : Integer


If (Is Windows:C1573)
	$n:=Size of array:C274(LinesCode)
	For ($i; 1; $n)
		ST SET ATTRIBUTES:C1093(LinesCode{$i}; ST Start text:K78:15; ST End text:K78:16; Attribute text size:K65:6; 12)
	End for 
End if 


If (Is macOS:C1572)
	$n:=Size of array:C274(LinesCode)
	For ($i; 1; $n)
		ST SET ATTRIBUTES:C1093(LinesCode{$i}; ST Start text:K78:15; ST End text:K78:16; Attribute text size:K65:6; 14)
	End for 
End if 
