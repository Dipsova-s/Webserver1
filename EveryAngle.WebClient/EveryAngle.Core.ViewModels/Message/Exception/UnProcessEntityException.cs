using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EveryAngle.Core.ViewModels.Message.Exception
{
    public class UnProcessEntityException : EAAppServerException
    {
        public UnProcessEntityException(string message)
            : base(message)
        {

        }

        public UnProcessEntityException(int statusCode, string message)
            : base(statusCode, message)
        {

        }
    }

}
