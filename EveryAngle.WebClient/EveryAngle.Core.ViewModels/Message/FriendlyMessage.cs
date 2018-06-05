using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EveryAngle.Core.ViewModels.Message
{

    public abstract class FriendlyMessage
    {

        public virtual string MapMessage(string message) { return message; }

        protected virtual JObject FindMessage(string message) { return null; }


    }

}
