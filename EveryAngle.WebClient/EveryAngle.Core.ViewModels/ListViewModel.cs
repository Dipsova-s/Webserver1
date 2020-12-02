using System;
using System.Collections.Generic;

namespace EveryAngle.Core.ViewModels
{
    [Serializable]
    public class ListViewModel<T>
    {
        public virtual List<T> Data { get; set; } = new List<T>();
        public HeaderViewModel Header { get; set; } = new HeaderViewModel();
    }
}
