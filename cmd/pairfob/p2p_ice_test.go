package main

import (
	"reflect"
	"testing"
)

func TestP2PICEServersFromEnv(t *testing.T) {
	cases := []struct {
		raw  string
		want []string
	}{
		{"", []string{defaultSTUNURL}},
		{" , ", []string{defaultSTUNURL}},
		{"none", nil},
		{" none ", nil},
		{"stun:stun.example.com:3478", []string{"stun:stun.example.com:3478"}},
		{" stun:a.example:3478 , ,stun:b.example:3478 ", []string{"stun:a.example:3478", "stun:b.example:3478"}},
	}
	for _, c := range cases {
		var got []string
		for _, server := range p2pICEServers(c.raw) {
			got = append(got, server.URLs...)
		}
		if !reflect.DeepEqual(got, c.want) {
			t.Errorf("p2pICEServers(%q) = %v, want %v", c.raw, got, c.want)
		}
	}
}
