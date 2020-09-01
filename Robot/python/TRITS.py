from testrail import *
from lxml import etree as XML
import re
import sys
import os
from datetime import datetime, timedelta
import glob

def getTCAndStatus(path):
    tags_xpath="//tag/text()[contains(.,'TC')]"
    root = XML.parse(path).getroot()  
    tag_elements = root.xpath(tags_xpath)
    TestCases = []
    TagsAndStatus = {}
    TagsAndElapsedTime={}
    for element in tag_elements:   
        RawTC=str(element)    
        if re.search("^TC[_-]C\\d+", RawTC):
            if RawTC not in TestCases:
                FilteredRawTC=re.findall("^TC[_-]C\\d+", RawTC)[0]
                EachTC=FilteredRawTC[3:len(FilteredRawTC)]                      
                TestCases.append(RawTC)            
                # get statuses of each Test case
                status_xpath="//tag[text() = \""+RawTC+"\"]/../../status"              
                status_elements =  root.xpath(status_xpath)
                TotalET=timedelta(hours=0, minutes=0, seconds=0,microseconds=000000)        
                for eachelement in status_elements: 
                    res = TagsAndStatus.setdefault(EachTC, [])
                    res.append(eachelement.attrib['status'])
                    # get elapsed time 
                    startTime=eachelement.attrib['starttime']
                    endTime=eachelement.attrib['endtime']
                    Etime=getElapsedTime(startTime, endTime)
                    # Add elapsed time of all robot TC for each testrail TC
                    t1 = timedelta(hours=Etime.hour, minutes=Etime.minute, seconds=Etime.second, microseconds=Etime.microsecond)
                    TotalET=TotalET+t1
                TotalETCopy=TotalET               
                # convert elapsed time to str
                if re.search("[0]\\d+",str(TotalET.microseconds)):    
                    TotalET = datetime.strptime(str(TotalET), '%H:%M:%S.%f').strftime("%H:%M:%S")                   
                else:                   
                    TotalET = datetime.strptime(str(TotalET), '%H:%M:%S').strftime("%H:%M:%S")
                # Add  TotalElapsedTime to  dictionary TagsAndElapsedTime
                ListElapsed = TagsAndElapsedTime.setdefault(EachTC, [])
                if len(ListElapsed)==0:
                    ListElapsed.append(TotalET) 
                else:
                    UpdateETforDup=(TotalETCopy + datetime.strptime(ListElapsed[0], '%H:%M:%S')).strftime("%H:%M:%S")
                    ListElapsed[0]=UpdateETforDup
                   
    # Merge 2 dictionaries TagsAndStatus and TagsAndElapsedTime
    DictTagsStatusET=MergeDict(TagsAndStatus, TagsAndElapsedTime)
    return  DictTagsStatusET

def MergeDict(dict1, dict2):
    result = {}
    for key in (dict1.keys() | dict2.keys()):
        if key in dict1: result.setdefault(key, []).extend(dict1[key])
        if key in dict2: result.setdefault(key, []).extend(dict2[key])

    return (result)

def AddResultToTestRail(RunId,strReportPath):
    print ("ReportPath is", strReportPath)
    # if ReportPath contains run id then dont add result to test rail
    if re.search("RunIdr?\\d+",strReportPath, re.IGNORECASE):
        TestCategory = re.findall("RunIdr?\\d+", strReportPath, re.IGNORECASE)
        print("TestCategory "+TestCategory[0]+" is not a tag of robot tests. Hence Adding robot result to testrail is ABORTED")
    else:
        AddResult(RunId,strReportPath)
        
def AddResult(RunId,ReportPath):
    Testrail = APIClient('https://testrail.everyangle.org')
    Testrail.user = 'CJoshi@magnitude.com '
    Testrail.password = '1kCYNICuKA6I4NyEYbGc-GE8dIXDI25qZed7QtLi6'

    # 'status_id': 1 is pass
    # 'status_id': 2 is block
    # 'status_id': 4 is Retest
    # 'status_id': 5 is Fail
      
    tagsAndStatus=getTCAndStatus(str(ReportPath))
    CommentDict={}
    CV=getClientVersion()
    for TC, EachstatusList in tagsAndStatus.items():
        ET=EachstatusList.pop()
        # Check Status list has Combination of PASS and FAIL
        if EachstatusList.count("PASS")>=1 and EachstatusList.count("FAIL")>=1:
            PassCount=EachstatusList.count("PASS")
            FAILCount=EachstatusList.count("FAIL")
            if PassCount>1:
                testcases=" testcases"
            else:
                testcases=" testcase"
            if FAILCount>1:
                testcase=" testcases"
            else:
                testcase=" testcase"
                
            CommentDict[TC]= "Automation result- "+str(PassCount)+str(testcases)+" passed and other "+str(FAILCount)+str(testcase)+" failed."
            RemoveCfromtags= TC[1:len(TC)]
            TestcaseDetails , status_code =Testrail.send_post('add_result_for_case/'+str(RunId)+'/'+RemoveCfromtags+'',{ 'status_id': 5, 'version': CV,'elapsed': str(ET) ,'comment': CommentDict.get(TC) })
            createLogs(str(ReportPath),TC,TestcaseDetails,status_code, CommentDict.get(TC))
                       
        else:        
            # Check Status list has only PASS  
            flag=True
            for Eachstatus in EachstatusList:
                if Eachstatus=='PASS':
                    pass
                else:
                    flag=False
            if flag:
                # if Status list has only PASS then add comment         
                PassCount=EachstatusList.count("PASS")
                if PassCount>1:
                    Comment="Automation result- "+ str(PassCount)+ " test cases Passed."
                elif PassCount==1:
                    Comment="Automation result- Test Passed."
                CommentDict[TC]=Comment
                RemoveCfromtags= TC[1:len(TC)]
                TestcaseDetails , status_code =Testrail.send_post('add_result_for_case/'+str(RunId)+'/'+RemoveCfromtags+'',{ 'status_id': 1, 'version': CV,'elapsed': str(ET),'comment': CommentDict.get(TC) })
                createLogs(str(ReportPath),TC,TestcaseDetails,status_code, CommentDict.get(TC))
               
            else:
                # Check Status list has only FAIL
                for Eachstatus in EachstatusList:
                    if Eachstatus=='FAIL':
                        pass
                    else:
                        assert True==False, "Condition to check only FAIL status for testcase "+str(TC)+" Failed."
                FAILCount=EachstatusList.count("FAIL")
                if FAILCount>1:
                    Comment="Automation result- "+str(FAILCount)+ " test cases Failed."
                elif FAILCount==1:
                    Comment="Automation result- Test Failed."
                CommentDict[TC]=Comment
                RemoveCfromtags= TC[1:len(TC)]
                TestcaseDetails , status_code =Testrail.send_post('add_result_for_case/'+str(RunId)+'/'+RemoveCfromtags+'',{ 'status_id': 5, 'version': CV,'elapsed': str(ET),'comment': CommentDict.get(TC) })
                createLogs(str(ReportPath),TC,TestcaseDetails,status_code, CommentDict.get(TC))
    # print ("Resultant Comments dictionary is : " +  str(CommentDict))
    print ("Robot results added to testrail")  
         
def getRunIDFromFileAndAddResult(ReportPath):
    this_dir = os.path.dirname(os.path.realpath(__file__))
    #if Run ID exist then add result
    if os.path.isfile(this_dir+'\\RunID.txt'):
        file = open(this_dir+"\\RunID.txt","r+")
        RunID=file.readline() 
        print ("Run Id for adding robot result to test rail is:"+RunID)  
        file.close() 
        AddResultToTestRail(RunID,str(ReportPath[0]))
    else:
        print ("Robot results are not added to testrail as Run ID does not exist")

def createLogs(ReportPath,TC,TestcaseDetails,status_code, RobotResultComment):
    # Check if Log Directory exists
    Logpath=ReportPath.replace("output.xml","TestrailUpdationLogs")
    if os.path.isdir(Logpath):
        pass
    else:
        os.mkdir(Logpath)
    # create Logs
    logFile=open(Logpath+"\\Log.txt","a+")
    if status_code>201:
        logFile.write("For "+str(TC)+", robot result FAILED To update to testrail. API status code is "+str(status_code)+".")
        logFile.write(str(TestcaseDetails)) 
        logFile.write("\n")   
        logFile.close()
    else:
        logFile.write("Robot result added to testrail successfully for test case "+str(TC)+". API status code is "+str(status_code)+". "+str(RobotResultComment)+"\n")    
        logFile.close()

def getElapsedTime(StartTime, EndTime):   
    format = '%Y%m%d %H:%M:%S.%f'
    Etime = datetime.strptime(EndTime, format) - datetime.strptime(StartTime, format)
    # convert to datetime.time
    Etime=(datetime.min + Etime).time()  
    
    return Etime

def getClientVersion():
    this_dir = os.path.dirname(os.path.realpath(__file__))
    PathEAWebServerSetup=this_dir.replace("RobotTests\\python","drop")
    SetupWithPath='\n'.join(glob.iglob(os.path.join(PathEAWebServerSetup, "EAWebServerSetup*")))
    Allnum=re.findall("\\d+", SetupWithPath)
    ListCV=[]
    CV=''
    # read Allnum in reverse and store in ListCV
    for i in range (-1, -5 , -1):
        ListCV.append(Allnum[i])
    # read ListCV in reverse and store in CV string by concatinating with dots to get readable CV
    for i in range (-1, -5 , -1):
        CV=CV+ListCV[i]+"."
    CV=CV[:-1]    
    return  CV

if __name__ == '__main__':
    # Map command line arguments to function arguments.
    getRunIDFromFileAndAddResult(sys.argv[1:]) 