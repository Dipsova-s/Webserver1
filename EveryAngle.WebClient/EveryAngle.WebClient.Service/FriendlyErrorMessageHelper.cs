using EveryAngle.Core.ViewModels.Message;
using EveryAngle.Core.ViewModels.Message.Exception;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace EveryAngle.WebClient.Service
{
    public static class FriendlyErrorMessageHelper
    {
        public static void GetFriendlyMessage(int statusCode, string message)
        {
            string errorContent = string.Empty;

            try
            {
                var json = JObject.Parse(message);
                errorContent = json.SelectToken("message").ToString();
            }
            catch
            {
                errorContent = message;
            }

            string output = message;

            switch (statusCode)
            {
                case 422:
                    UnProcessEntityMessage entity = new UnProcessEntityMessage();
                    output = entity.MapMessage(errorContent);
                    throw new UnProcessEntityException(statusCode, output);
             
                case 409:
                    ConflictMessage conflict = new ConflictMessage();
                    output = conflict.MapMessage(errorContent);
                    throw new ConflictException(statusCode, output);
                 
                default:
                    throw new HttpException(statusCode, output);
                   
            }
        }
    }
}
