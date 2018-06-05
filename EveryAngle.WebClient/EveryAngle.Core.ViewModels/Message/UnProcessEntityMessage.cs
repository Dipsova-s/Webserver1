using EveryAngle.Shared.Globalization;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace EveryAngle.Core.ViewModels.Message
{
    public class UnProcessEntityMessage : FriendlyMessage
    {
        protected string header = Captions.UnProcessEntity_Header_Message;
        private readonly Dictionary<string, string> dictionaries = new Dictionary<string, string>();

        public override string MapMessage(string message)
        {
            return FindMessage(message).ToString();
        }

        protected override JObject FindMessage(string message)
        {
            string resultMessage = message;
            foreach (KeyValuePair<string, string> item in dictionaries)
            {
                Regex regex = new Regex(item.Key.ToLowerInvariant());
                if (regex.IsMatch(message.ToLowerInvariant()))
                {
                    resultMessage = item.Value;
                    break;
                }
            }

            JObject output = JObject.FromObject(new
            {
                reason = header,
                message = resultMessage
            });



            return output;
        }
    }
}
