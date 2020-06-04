*** Keywords ***
Screenshot "WC_Homepage" page
    Crop Panes Homepage

Crop Panes Homepage
    Set Window Size    1300   850
    Sleep    ${TIMEOUT_LARGEST}

    # make videos screenshot
    Search Filter By Query String    sort=name&dir=asc&fq=facetcat_bp:(S2D)%20AND%20-facetcat_characteristics:(facet_has_warnings)
    Click Change View To Displays Mode
    Capture page screenshot  video3.png
    Click Create Angle Button
    Click Object Activity Diagram Button
    Capture page screenshot  video1.png
    Click Back Button To Back To Create Angle Options
    Click Object Diagram Button
    Capture page screenshot  video2.png
    Go to Search Page

    # check existing videos
    Page Should Contain Element  css=#WelcomePlayer > *  Please upload movies from "<robot>/webhelp_items/movies" to "<website>/resources/movies"

    # top message
    Execute JavaScript
    ...   var text = '<p style="font-size:35px;margin:0 0 40px 0;"><strong>Do more</strong> than just report on your business</p>';
    ...   text += '<p style="font-size:16px;margin:0 0 20px 0;">What if there was a way to really understand what’s going on in your organization?<br>';
    ...   text += 'A way to not only report on events, but a way to understand them, control them, improve them.</p>';
    ...   text += '<p style="font-size:16px;margin:0;">Imagine if you were able to understand the root causes of issues?<br>';
    ...   text += 'To be empowered to answer questions as you think of them. Imagine no more...</p>';
    ...   $('.sectionWelcomeDetail1 .content').html(text);

    # bottom message
    Execute JavaScript
    ...   var text = '<p style="font-size:13px;margin:0 0 20px 0;">We’re excited to announce that on November 7th, 2019, we will be hosting the Every Angle Summit – our annual Customer Day – at Studio’s Aalsmeer (The Netherlands).</p>';
    ...   text += '<p style="font-size:13px;margin:0 0 20px 0;">If you have not attended the Every Angle Summit before: this event is designed to provide attendees with an update on the latest news in the area of Operational Business Analytics, S/4HANA, our solutions roadmap and the newest software solutions now part of the Magnitude family. You will meet members of our management team, consulting team, developers and sales & marketing team, and have the opportunity to network with other Every Angle customers.</p>';
    ...   text += '<p style="font-size:13px;margin:0;">We are looking forward to meeting you on November 7th! If you wish to join, please register here. Seating is limited – early registration is advised. After you register, you will receive a confirmation email with additional information about the Summit.</p>';
    ...   $('.sectionWelcomeDetail2 .content').html(text);

    # logo
    Crop WebHelp Image With Dimensions    __logo.png    css=#TopBar .Wrapper    50    3    150    41  ${False}
    ${output}    Get WebHelp Output Folder  ${False}
    ${logoName}  Get WebHelp Image Name  __logo.png  ${False}
    ${logo}  Image To Base64  ${output}${/}${logoName}
    Execute JavaScript  $('.sectionWelcomeLogo img').attr('src', "${logo}");
    Remove File  ${output}${/}${logoName}

    # videos
    ${video1}  Image To Base64  ${OUTPUT_DIR}${/}video1.png
    ${video2}  Image To Base64  ${OUTPUT_DIR}${/}video2.png
    ${video3}  Image To Base64  ${OUTPUT_DIR}${/}video3.png
    Execute JavaScript
    ...  $('#WelcomePlayer .vjs-error-display').addClass('vjs-hidden');
    ...  $('#WelcomePlayer .vjs-poster').removeClass('vjs-hidden').css('background-image', 'url("${video1}")');
    ...  $('#WelcomePlayer img:eq(0)').attr('src', "${video1}");
    ...  $('#WelcomePlayer img:eq(1)').attr('src', "${video2}");
    ...  $('#WelcomePlayer img:eq(2)').attr('src', "${video3}");

    Set Window Size    ${WINDOW_WIDTH}   900
    Sleep    ${TIMEOUT_LARGEST}

    Highlight WebHelp Element    css=#TopBar           text=1
    Update Heightlight Box   height   3
    Highlight WebHelp Element    css=#SearchBar        text=2
    Highlight WebHelp Element    css=#LeftMenu         text=3
    Update Heightlight Box   width   3
    Highlight WebHelp Element    css=#LandingPage      text=4
    Update Heightlight Box   top   -3
    Update Heightlight Box   height   3
    Crop WebHelp Image    WC_panes_homepage.png    css=body
    Clear WebHelp Highlights

    Maximize Browser window
    Sleep    ${TIMEOUT_LARGEST}