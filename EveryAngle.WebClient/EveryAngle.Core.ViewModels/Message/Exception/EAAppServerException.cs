using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EveryAngle.Core.ViewModels.Message.Exception
{
    public class EAAppServerException : EAException
    {
        protected EAAppServerException()
        { }
        protected EAAppServerException(string message) : base(message) { }
        protected EAAppServerException(int statusCode, string message) : base(statusCode, message) { }
        protected EAAppServerException(string message, System. Exception innerException) : base(message, innerException) { }
        protected EAAppServerException(System.Exception innerException) : base(String.Empty, innerException) { }

    }
}
