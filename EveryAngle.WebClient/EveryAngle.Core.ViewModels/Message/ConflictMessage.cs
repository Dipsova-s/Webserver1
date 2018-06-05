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
    public class ConflictMessage : FriendlyMessage
    {
        protected string header = Captions.Conflict_Header_Message;

        public override string MapMessage(string message)
        {
            return FindMessage(message).ToString();
        }

        protected override JObject FindMessage(string message)
        {
            string resultMessage = message;
            JObject output = JObject.FromObject(new
            {
                reason = header,
                message = resultMessage
            });

            return output;
        }
    }
}
