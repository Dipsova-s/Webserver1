*** Keywords ***
Screenshot "WC_How_to_create___publish___delete_an_Angle" page
    Go to Search Page
    Click Create Angle Button
    Crop S2D Activity Diagram
    Click Back Button To Back To Create Angle Options
    Crop P2P Object Diagram
    Click Back Button To Back To Create Angle Options
    Crop Object List

Crop S2D Activity Diagram   
    Click Object Activity Diagram Button
    Crop WebHelp Image    wc_s2d_activitydiagram.png    css=.popupCreateNewAngleBySchema


Crop P2P Object Diagram
    Click Object Diagram Button
    Click P2P Business Processes On Create Angle Diagram Options
    Crop WebHelp Image    wc_p2p_objectdiagram.png    css=.popupCreateNewAngleBySchema


Crop Object List
    Click Object List Button
    Crop WebHelp Image    wc_object_list.png    css=.popupCreateNewAngle 
