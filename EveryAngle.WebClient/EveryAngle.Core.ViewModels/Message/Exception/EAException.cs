using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace EveryAngle.Core.ViewModels.Message.Exception
{
    public abstract class EAException : HttpException
    {
        public string EAErrorcode { get; set; }

        protected EAException() { }
        protected EAException(string message) : base(message) { }
        protected EAException(int statusCode, string message) : base(statusCode, message) { }
        protected EAException(string message, System.Exception innerException) : base(message, innerException) { }
        protected EAException(System.Exception innerException) : base(String.Empty, innerException) { }
    }
}
