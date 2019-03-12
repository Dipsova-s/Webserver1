*** Keywords ***
Screenshot "WC_Homepage" page
    Search Filter By Query String    sort=name&dir=asc&fq=facetcat_bp:(S2D)%20AND%20-facetcat_characteristics:(facet_has_warnings)
    Click Change View To Displays Mode

    Crop Logo
    Crop Panes Homepage

Crop Logo
    # the same image as WC_Action_Button_Logo.png
    Crop WebHelp Image With Dimensions    WC_EA_Logo.png    css=#TopBar .Wrapper    15    3    150    41

Crop Panes Homepage
    Highlight WebHelp Element    css=#TopBar        text=1
    Highlight WebHelp Element    css=#LeftMenu      text=2
    Highlight WebHelp Element    css=#Content       text=3
    Crop WebHelp Image    WC_panes_homepage.png    css=#MainContainer
    Clear WebHelp Highlights
