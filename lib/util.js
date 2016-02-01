module.exports = {
	matchType: function(arr, type, keys) {
		for (var i = 0; i < arr.length; i++) {
			if (typeof arr[i] != type) {
				if (keys) {
					var objKeys = Object.keys(keys);

					for (var i = 0; i < objKeys.length; i++) {
						if (typeof arr[i][objKeys[i]] != objKeys[i].type) {
							return false
						}
					}
				} else {
					return false;
				}
			}
		}

		return true;
	}
}