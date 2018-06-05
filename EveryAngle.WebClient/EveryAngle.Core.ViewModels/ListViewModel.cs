using System;
using System.Collections.Generic;

namespace EveryAngle.Core.ViewModels
{
    [Serializable]
    public class ListViewModel<T>
    {
       public List<T> Data { get; set; }
       public HeaderViewModel Header { get; set; }
    }
}
