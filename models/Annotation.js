const mongoose = require("mongoose");

const RegionSchema = mongoose.Schema({
    id: String,
    color: String,
    cls: String,
    editingLabels: Boolean,
    highlighted: Boolean,
    type: String,
    x: Number,
    y: Number,
    w: Number,
    h: Number,
    tag: String,
    line: String,
    eqCls: String,
    size: String
})

const DataSchema = mongoose.Schema({
    images: [{
        fileName: String,
        imgName: String,
        url: String,
        thumbnailUrl: String,
        height: Number,
        width: Number,
        regions: [RegionSchema]
    }],
    projectName: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
})

module.exports = mongoose.model('annotations', DataSchema);