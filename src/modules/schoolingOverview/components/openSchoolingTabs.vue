<template>
    <tabs :on-select="(_, index) => (currentTab = tabTitles[index])">
        <tab v-for="tab in tabTitles" :key="tab" :title="tab">
            <enhanced-table
                :head="heads"
                :table-attrs="{ class: 'table table-striped' }"
                @sort="setSorting"
                :sort="sort"
                :sort-dir="sortDir"
                :search="search"
                @search="s => (search = s)"
            >
                <tr
                    v-for="(schooling, id) in schoolings"
                    :key="id"
                    class="schooling_opened_table_searchable"
                >
                    <td>
                        <a
                            class="btn btn-success"
                            :href="`/schoolings/${schooling.id}`"
                        >
                            {{ schooling.name }}
                        </a>
                    </td>
                    <td>{{ schooling.seats }}</td>
                    <td>{{ schooling.price }}</td>
                    <td :id="`education_schooling_${schooling.id}`">
                        {{ schooling.end }}
                    </td>
                    <td v-html="schooling.owner"></td>
                </tr>
            </enhanced-table>
        </tab>
    </tabs>
</template>

<script lang="ts">
import Vue from 'vue';
import {
    OpenSchoolingTabs,
    OpenSchoolingTabsMethods,
    OpenSchoolingTabsComputed,
    OpenSchooling,
} from 'typings/modules/SchoolingOverview/OpenSchoolingTabs';
import { DefaultProps } from 'vue/types/options';

export default Vue.extend<
    OpenSchoolingTabs,
    OpenSchoolingTabsMethods,
    OpenSchoolingTabsComputed,
    DefaultProps
>({
    name: 'openSchoolingTabs',
    components: {
        EnhancedTable: () =>
            import(
                /* webpackChunkName: "components/enhanced-table" */ '../../../components/enhanced-table.vue'
            ),
    },
    data() {
        const heads = {} as {
            [key: string]: {
                title: string;
            };
        };
        ['name', 'seats', 'price', 'end', 'owner'].forEach(
            head =>
                (heads[head] = {
                    title: this.$t(
                        `modules.schoolingOverview.titles.${head}`
                    ).toString(),
                })
        );
        const tabTitles = Object.keys(this.$t('schoolings'));
        return {
            heads,
            tabTitles,
            currentTab: tabTitles[0],
            tabs: {},
            search: '',
            sort: 'name',
            sortDir: 'asc',
        } as OpenSchoolingTabs;
    },
    computed: {
        schoolings() {
            const schoolings = this.tabs[this.currentTab] || [];
            return (this.search
                ? schoolings.filter(a =>
                      JSON.stringify(Object.values(a))
                          .toLowerCase()
                          .match(this.search.toLowerCase())
                  )
                : schoolings
            ).sort((a, b) => {
                let modifier = 1;
                if (this.sortDir === 'desc') modifier = -1;
                if (a[this.sort] < b[this.sort]) return -1 * modifier;
                if (a[this.sort] > b[this.sort]) return modifier;
                return 0;
            });
        },
    },
    methods: {
        setSorting(key) {
            let s = key;
            this.sortDir =
                s === this.sort && this.sortDir === 'asc' ? 'desc' : 'asc';
            this.sort = s;
        },
    },
    beforeMount() {
        let tabs = {} as {
            [tab: string]: OpenSchooling[];
        };
        document
            .querySelectorAll(
                '#schooling_opened_table tr.schooling_opened_table_searchable'
            )
            .forEach(schooling => {
                let btn = schooling.querySelector(
                    'a.btn-success'
                ) as HTMLLinkElement;
                if (!btn) return;
                let name = btn.textContent || '';
                let category =
                    name
                        ?.match(/^.*?-/)?.[0]
                        .replace('-', '')
                        .trim() || '';
                const seatNode = schooling.querySelector('td:nth-of-type(2)');
                const endNode = schooling.querySelector('td:nth-of-type(4)');
                let owner = schooling.querySelector('td:nth-of-type(5)');
                if (!seatNode || !endNode || !owner) return;
                let seats = parseInt(seatNode.textContent || '0');
                let price =
                    schooling.querySelector('td:nth-of-type(3)')?.textContent ||
                    '';
                let end = parseInt(endNode.getAttribute('sortvalue') || '0');
                if (!tabs.hasOwnProperty(category)) tabs[category] = [];
                tabs[category].push({
                    id: btn.href.replace(/\D+/g, ''),
                    name,
                    seats,
                    price,
                    end,
                    owner: owner.innerHTML,
                });
            });
        this.tabs = tabs;
    },
});
</script>

<style scoped lang="sass">
th
    cursor: pointer
</style>
