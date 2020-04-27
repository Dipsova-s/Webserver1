from httplibs import HTTP 

httpreq = HTTP()

def create_http_context_(host, scheme):
    httpreq.create_http_context(host, scheme)

def set_basic_auth_(username, passcode):
    httpreq.set_basic_auth(username, passcode)

def set_request_header_(contenttype, filestring):
    httpreq.set_request_header(contenttype, filestring)

def set_request_body_(rbody):
    httpreq.set_request_body(rbody)

def set_json_value_(jstring, jpointer, jvalue):
    httpreq.set_json_value(jstring, jpointer, jvalue)

def get_(endpoint):
    httpreq.GET(endpoint)

def post_(endpoint):
    httpreq.POST(endpoint)

def put_(endpoint):
    httpreq.PUT(endpoint)

def delete_(endpoint):
    httpreq.DELETE(endpoint)

def response_status_code_should_equal_(rescode):
    httpreq.response_status_code_should_equal(rescode)

def response_status_code_should_not_equal_(rescode):
    httpreq.response_status_code_should_not_equal(rescode)

def get_response_header_(hname):
    return httpreq.get_response_header(hname)

def get_response_body_():
    return httpreq.get_response_body()

def get_response_status_():
    return httpreq.get_response_status()

def get_json_value_(jstring, jpointer):
    return httpreq.get_json_value(jstring, jpointer)

def should_be_valid_json_(jsonfile):
    httpreq.should_be_valid_json(jsonfile)

def parse_json_(jstring):
    return httpreq.parse_json(jstring)

def stringify_json_(jstring):
    return httpreq.stringify_json(jstring)

def show_response_body_in_browser_():
    httpreq.show_response_body_in_browser()

def log_json_(jstring):
    httpreq.log_json(jstring)

def log_response_headers_():
    httpreq.log_response_headers()

def log_response_status_():
    httpreq.log_response_status()

def log_response_body_():
    httpreq.log_response_body()
    
def next_request_should_not_succeed_():
    httpreq.next_request_should_not_succeed()
    
def next_request_should_succeed_():
    httpreq.next_request_should_succeed()