Number.prototype.getSafeDecimals = function (addDecimals) {
    /// <summary>get safe decimal places</summary>
    /// <param name="addDecimals" type="Number" optional="true">default = 0, additional decimals</param>
    /// <returns type="Number"></returns>
};

Number.prototype.safeParse = function (safeDecimals) {
    /// <summary>parse value with safe decimal places</summary>
    /// <param name="safeDecimals" type="Number">safe decimal places from getSafeDecimals function</param>
    /// <returns type="Number"></returns>
};

Array.prototype.sum = function () {
    /// <summary>
    /// <para>summary value of Array</para>
    /// <para>e.g. -> [2,3,4,5,6].sum()</para>
    /// </summary>
    /// <returns type="Number"></returns>
};

Array.prototype.max = function () {
    /// <summary>
    /// <para>maximum value of Array</para>
    /// <para>e.g. -> [2,3,4,5,6].max()</para>
    /// </summary>
    /// <returns type="Number"></returns>
};

Array.prototype.min = function () {
    /// <summary>
    /// <para>minimun value of Array</para>
    /// <para>e.g. -> [2,3,4,5,6].min()</para>
    /// </summary>
    /// <returns type="Number"></returns>
};

Array.prototype.indexOfObject = function (name, filter, sensitive) {
    /// <summary>
    /// index of json object in array
    /// </summary>
    /// <param name="name" type="String">json property name to find</param>
    /// <param name="filter" type="Object">value to find (can be function)</param>
    /// <param name="sensitive" type="Boolean" optional="true">default: false, is case sensitive or not?</param>
    /// <returns type="Number">index of array (-1 if not found)</returns>
};

Array.prototype.hasObject = function (name, filter, sensitive) {
    /// <summary>
    /// has json object in array or not?
    /// </summary>
    /// <param name="name" type="String">json property name to find</param>
    /// <param name="filter" type="Object">value to find (can be function)</param>
    /// <param name="sensitive" type="Boolean" optional="true">default: false, is case sensitive or not?</param>
    /// <returns type="Boolean"></returns>
};

Array.prototype.findObject = function (name, filter, sensitive) {
    /// <summary>
    /// find json object in array
    /// </summary>
    /// <param name="name" type="String">json property name to find</param>
    /// <param name="filter" type="Object">value to find (can be function)</param>
    /// <param name="sensitive" type="Boolean" optional="true">default: false, is case sensitive or not?</param>
    /// <returns type="Object">first finding json object</returns>
};

Array.prototype.findObjects = function (name, filter, sensitive) {
    /// <summary>
    /// find json objects in array
    /// </summary>
    /// <param name="name" type="String">json property name to find</param>
    /// <param name="filter" type="Object">value to find (can be function)</param>
    /// <param name="sensitive" type="Boolean" optional="true">default: false, is case sensitive or not?</param>
    /// <returns type="Array">finding json objects</returns>
};

Array.prototype.removeObject = function (name, filter, sensitive) {
    /// <summary>
    /// remove matched json objects in array
    /// </summary>
    /// <param name="name" type="String">json property name to find</param>
    /// <param name="filter" type="Object">value to find (can be function)</param>
    /// <param name="sensitive" type="Boolean" optional="true">default: false, is case sensitive or not?</param>
};


Array.prototype.sortObject = function (name, direction, sensitive) {
    /// <summary>
    /// sort json object
    /// </summary>
    /// <param name="name" type="String">json property name to find</param>
    /// <param name="direction" type="Object">optional, sort direction: -1 = ASC (default), 1 = DESC</param>
    /// <param name="sensitive" type="Boolean" optional="true">default: false, is case sensitive or not?</param>
};


Array.prototype.distinct = function (converter) {
    /// <summary>
    /// get rid of duplicating value in array
    /// </summary>
    /// <param name="converter" type="Function" optional="true">converter function before conparing</param>
    /// <returns type="Array">unique values in array</returns>
};

Array.prototype.pushDeferred = function (fn, args) {
    /// <summary>
    /// add deferred object
    /// </summary>
    /// <param name="fn" type="Function">function</param>
    /// <param name="args" type="Array" optional="true">arguments</param>
};

jQuery.extend(jQuery, {
    injectCSS: function (rules, id) {
        /// <summary>
        /// inject css into document
        /// </summary>
        /// <param name="rules" type="String">css rules</param>
        /// <param name="id" type="String" optional="true">id of rule</param>
    }
});
