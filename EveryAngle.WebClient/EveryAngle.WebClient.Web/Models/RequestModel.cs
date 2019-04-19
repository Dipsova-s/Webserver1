using RestSharp;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace EveryAngle.WebClient.Web.Models
{
    public class RequestModel
    {
        public Method method { get; set; }
        public string url { get; set; }
        public string data { get; set; }
    }
}