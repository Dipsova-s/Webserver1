import sys
import os
import re

this_dir = os.path.dirname(os.path.realpath(__file__))
def StoreServerTags(tags):
    tag=str(tags[0])
    # this_dir = os.path.dirname(os.path.realpath(__file__))
       
    if re.search("^RunIdr?\\d+$",tag, re.IGNORECASE):
        RunId = re.findall("\\d+$",tag)
        filePathRunId = os.path.join(this_dir, 'RunID.txt')
        RunIDtxtfile=  open(filePathRunId,"a+")
        RunIDtxtfile.write(str(RunId[0]))
        RunIDtxtfile.close()
    else:
        file_path = os.path.join(this_dir, 'TagsFromServer.txt')
        file=  open(file_path,"a+")
        file.write(tag+"\n" )
        file.close()



if __name__ == '__main__':
    # Map command line arguments to function arguments.
    StoreServerTags(sys.argv[1:])
