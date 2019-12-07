from django import forms
from .models import Customer
from django.utils.translation import ugettext as _


class CustomerForm(forms.ModelForm):
    class Meta:
        model = Customer
        fields = '__all__'
        exclude = ('payment_type',)

    def __init__(self, *args, **kwargs):
        super(CustomerForm, self).__init__(*args, **kwargs)
        for field in self.fields:
            self.fields[field].widget.attrs['placeholder'] = _(self.fields[field].label)
            self.fields[field].label = ''
