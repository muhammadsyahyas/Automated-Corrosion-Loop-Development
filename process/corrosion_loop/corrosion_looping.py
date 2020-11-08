import numpy as np
import argparse
import json
import os
import xlrd
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans

import ssl
ssl._create_default_https_context = ssl._create_unverified_context

ap = argparse.ArgumentParser()
ap.add_argument("-s", "--selectedFeatures", help="Selected features")
args = vars(ap.parse_args())

def createDataFrame():
	book = xlrd.open_workbook("./temp/excel/input.xlsx")
	sheet = book.sheet_by_index(0)
	data = []
	sheet.row_values(0)
	for i in range(sheet.nrows):
		if i > 0:
			data.append(sheet.row_values(i))
	df = pd.DataFrame(data, columns = sheet.row_values(0))
	return df

def categoricalFeaturesGrouping(df, categoricalFeatures):
	categoricalGroups = df.groupby(by=categoricalFeatures, axis = 0)
	return categoricalGroups

def inertiaCalculationFunction(categoricalGroups, categoricalGroup, categoricalGroupMembers, numericalFeatures, maxDiffList):    
	members = categoricalGroups.get_group(categoricalGroup)
	membersNumerical = members[numericalFeatures]
	ks = range(1,len(members) + 1) # ks represents the number of division to be made
	for k in ks:
		model = KMeans(n_clusters = k, random_state = 42)
		model.fit(membersNumerical)
		label = model.predict(membersNumerical)
		inertia = np.nan_to_num(model.inertia_)
		members.loc[:,"LABEL"] = label
		membersGrouped = members.groupby("LABEL")
		diffList = list()
		for feature in numericalFeatures:
			diff = membersGrouped[feature].aggregate(np.max) - membersGrouped[feature].aggregate(np.min)
			#print(diff[0])
			diffList.append(diff[0])
		#print(diffList)
		if diffList < maxDiffList:
			return members, np.mean(inertia)
		elif k == ks:
			return members, np.mean(inertia)
		else:
			pass

def numericalFeaturesGrouping(categoricalGroups, categoricalFeatures, numericalFeatures, maxDiffList):
	corrosionLoops = pd.DataFrame()
	corrosionLoopName = list()
	inertiaList = list()
	for categoricalGroup, categoricalGroupMembers in categoricalGroups: 
		loops, inertia = inertiaCalculationFunction(categoricalGroups, categoricalGroup, categoricalGroupMembers, numericalFeatures, maxDiffList)
		corrosionLoops = corrosionLoops.append(loops)
		inertiaList.append(inertia)
	#Naming the corrosion loops
	for index, row in corrosionLoops.iterrows():
		name = ""
		for feature in categoricalFeatures:
			name = name + str(row[feature]) + "-"
		name = name + str(row["LABEL"])
		corrosionLoopName.append(name)
	corrosionLoops["CORROSION_LOOP"] = corrosionLoopName
	# numberOfCorrLoop = len(corrosionLoops["CORROSION_LOOP"].unique())
	return corrosionLoops

if __name__ == "__main__": 
	df = createDataFrame()
	selectedFeatures = eval(args["selectedFeatures"])
	categoricalFeatures = []
	numericalFeatures = []
	maxDiffList = []
	for feature in selectedFeatures:
		if selectedFeatures[feature][0] == "Categorical":
			categoricalFeatures.append(feature)
		elif selectedFeatures[feature][0] == "Numerical":
			numericalFeatures.append(feature)
			maxDiffList.append(float(selectedFeatures[feature][1]))
	categoricalGroups = categoricalFeaturesGrouping(df, categoricalFeatures)
	corrosionLoops = numericalFeaturesGrouping(categoricalGroups, categoricalFeatures, numericalFeatures, maxDiffList)
	del corrosionLoops['LABEL']
	corrosionLoops.to_excel("./temp/result/output.xlsx")
