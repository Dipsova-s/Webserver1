*** Keywords ***
Screenshot "WC_How_to_create___publish___delete_an_Angle" page
    Go to Search Page
    Click Create Angle Button
    Crop S2D Activity Diagram
    Crop Object List

Crop S2D Activity Diagram   
    Click Object Activity Diagram Button
    Crop WebHelp Image    WC_S2D_ActivityDiagram.png    css=.popupCreateNewAngleBySchema
    Click Back Button To Back To Create Angle Options

Crop Object List
    Click Object List Button
    Crop WebHelp Image    WC_object_list.png    css=.popupCreateNewAngle 