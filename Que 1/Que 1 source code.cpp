#include <bits/stdc++.h>
using namespace std;
#define int long long

bool compare(vector<int> a,vector<int> b){
	return a[0]<b[0];
}

void optimizeBookings(vector<vector<int>> number){
	sort(number.begin(),number.end(),compare);
	int end_prev=-1;
	int n=number.size();
	vector<vector<int>> answer;
	for(int i=0;i<n;i++){
		//To check weather prevoius uploaded meet time overlaps with new interval time
		if(number[i][0]>end_prev){
			answer.push_back({number[i][0],number[i][1]});
			end_prev=number[i][1];
		}else{
			vector<int> prev=answer.back();
			answer.pop_back();
			int st=prev[0],en=max(number[i][1],prev[1]);
			answer.push_back({st,en});
			end_prev=en;
		}
	}
	for(auto x:answer){
		cout<<x[0]<<' '<<x[1];
		cout<<endl;
	}
}
int32_t main() {
	ios_base::sync_with_stdio(NULL);
	cin.tie(NULL);
	cout.tie(NULL);
    int t; // Number of Testcases
    cin>>t;
    while(t--){
    	int n;
    	cin>>n;
    	vector<vector<int>> number(n);
    	for(int i=0;i<n;i++){
    		int st,en;
    		cin>>st>>en;
    		number[i]={st,en};
    	}
    	optimizeBookings(number);
    }
    return 0;
}
